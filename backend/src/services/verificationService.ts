import axios from "axios";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

// LeetCode GraphQL query to fetch recent submissions
const RECENT_SUBMISSIONS_QUERY = `
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      title
      titleSlug
      timestamp
    }
  }
`;

export interface LeetCodeSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
}

/**
 * Verify that a user has solved a specific problem on LeetCode
 * @param username - LeetCode username
 * @param problemSlug - Problem slug (e.g., "two-sum")
 * @param timeWindowHours - How far back to check (default: 24 hours)
 * @returns true if the problem was solved within the time window
 */
export const verifyLeetCodeSubmission = async (
  username: string,
  problemSlug: string,
  timeWindowHours: number = 24
): Promise<{ verified: boolean; submission?: LeetCodeSubmission }> => {
  try {
    const response = await axios.post(
      LEETCODE_GRAPHQL_URL,
      {
        query: RECENT_SUBMISSIONS_QUERY,
        variables: {
          username,
          limit: 50, // Check last 50 accepted submissions
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Referer: "https://leetcode.com",
        },
      }
    );

    const submissions: LeetCodeSubmission[] =
      response.data?.data?.recentAcSubmissionList || [];

    if (submissions.length === 0) {
      return { verified: false };
    }

    // Check if the problem slug exists in recent submissions
    const timeWindowMs = timeWindowHours * 60 * 60 * 1000;
    const cutoffTime = Date.now() - timeWindowMs;

    const matchingSubmission = submissions.find((sub) => {
      const submissionTime = parseInt(sub.timestamp) * 1000; // Convert to milliseconds
      return (
        sub.titleSlug === problemSlug && submissionTime >= cutoffTime
      );
    });

    if (matchingSubmission) {
      return {
        verified: true,
        submission: matchingSubmission,
      };
    }

    return { verified: false };
  } catch (error: any) {
    // Check if it's a user not found error
    if (error.response?.data?.errors) {
      const errorMessage = error.response.data.errors[0]?.message || "";
      if (errorMessage.includes("does not exist")) {
        throw new Error(`LeetCode user "${username}" not found. Make sure the username is correct and the profile is public.`);
      }
    }

    console.error("LeetCode verification error:", error);
    throw new Error(
      "Failed to verify LeetCode submission. Please try again later."
    );
  }
};

/**
 * Get all recent accepted submissions for a user
 * Useful for displaying user's recent activity
 */
export const getRecentSubmissions = async (
  username: string,
  limit: number = 20
): Promise<LeetCodeSubmission[]> => {
  try {
    const response = await axios.post(
      LEETCODE_GRAPHQL_URL,
      {
        query: RECENT_SUBMISSIONS_QUERY,
        variables: { username, limit },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Referer: "https://leetcode.com",
        },
      }
    );

    return response.data?.data?.recentAcSubmissionList || [];
  } catch (error) {
    console.error("Failed to fetch recent submissions:", error);
    return [];
  }
};
