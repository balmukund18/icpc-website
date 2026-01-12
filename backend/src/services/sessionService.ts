import prisma from '../models/prismaClient';

export const createSession = async (data: any) => {
	// Clean up empty strings and convert date to proper format
	const cleanedData: any = {
		title: data.title,
		meetLink: data.meetLink,
		details: data.details || null,
		date: data.date ? new Date(data.date) : null,
	};
	return prisma.session.create({ data: cleanedData });
};

export const updateSession = async (id: string, data: any) => {
	// Clean up empty strings and convert date to proper format
	const cleanedData: any = {};
	
	if (data.title !== undefined) cleanedData.title = data.title;
	if (data.meetLink !== undefined) cleanedData.meetLink = data.meetLink;
	if (data.details !== undefined) cleanedData.details = data.details || null;
	if (data.date !== undefined) cleanedData.date = data.date ? new Date(data.date) : null;
	
	return prisma.session.update({ where: { id }, data: cleanedData });
};

export const deleteSession = async (id: string) => prisma.session.delete({ where: { id } });
export const listSessions = async () => prisma.session.findMany({ orderBy: { date: 'desc' } });
export const getSessionById = async (id: string) => {
	const session = await prisma.session.findUnique({ where: { id } });
	if (!session) throw new Error('Session not found');
	return session;
};
export const registerForSession = async (sessionId: string, userId: string) => {
	const s = await prisma.session.findUnique({ where: { id: sessionId } });
	if (!s) throw new Error('Session not found');
	const attendees = (s.attendees as any[]) || [];
	if (!attendees.includes(userId)) attendees.push(userId);
	return prisma.session.update({ where: { id: sessionId }, data: { attendees } });
};

export const markAttendance = async (sessionId: string, userId: string, present: boolean) => {
	const s = await prisma.session.findUnique({ where: { id: sessionId } });
	if (!s) throw new Error('Session not found');
	const attendees = (s.attendees as any[]) || [];
	const index = attendees.findIndex((a: any) => a.userId === userId);
	if (index >= 0) {
		attendees[index] = { userId, present };
	} else {
		attendees.push({ userId, present });
	}
	return prisma.session.update({ where: { id: sessionId }, data: { attendees } });
};
