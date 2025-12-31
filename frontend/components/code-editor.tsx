"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

// Dynamically import CodeMirror to avoid SSR issues
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-800 rounded-md flex items-center justify-center text-gray-400">
      Loading editor...
    </div>
  ),
});

// Judge0 language IDs
export const LANGUAGES = [
  { id: 54, name: "C++ (GCC 9.2.0)", extension: cpp },
  { id: 52, name: "C++ (GCC 7.4.0)", extension: cpp },
  { id: 71, name: "Python (3.8.1)", extension: python },
  { id: 62, name: "Java (OpenJDK 13.0.1)", extension: java },
  { id: 63, name: "JavaScript (Node.js 12.14.0)", extension: javascript },
] as const;

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  languageId: number;
  height?: string;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  languageId,
  height = "400px",
  readOnly = false,
}: CodeEditorProps) {
  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange]
  );

  // Get language extension based on language ID
  const getLanguageExtension = () => {
    const lang = LANGUAGES.find((l) => l.id === languageId);
    if (lang) {
      return lang.extension();
    }
    return cpp(); // Default to C++
  };

  return (
    <CodeMirror
      value={value}
      height={height}
      theme={oneDark}
      extensions={[getLanguageExtension()]}
      onChange={handleChange}
      readOnly={readOnly}
      className="rounded-md overflow-hidden border border-gray-700"
      basicSetup={{
        lineNumbers: true,
        highlightActiveLineGutter: true,
        highlightSpecialChars: true,
        history: true,
        foldGutter: true,
        drawSelection: true,
        dropCursor: true,
        allowMultipleSelections: true,
        indentOnInput: true,
        syntaxHighlighting: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: true,
        rectangularSelection: true,
        crosshairCursor: true,
        highlightActiveLine: true,
        highlightSelectionMatches: true,
        closeBracketsKeymap: true,
        defaultKeymap: true,
        searchKeymap: true,
        historyKeymap: true,
        foldKeymap: true,
        completionKeymap: true,
        lintKeymap: true,
      }}
    />
  );
}

// Default code templates for each language
export const CODE_TEMPLATES: Record<number, string> = {
  54: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Your code here
    
    return 0;
}`,
  52: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Your code here
    
    return 0;
}`,
  71: `# Your code here

def main():
    pass

if __name__ == "__main__":
    main()`,
  62: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your code here
    }
}`,
  63: `const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Your code here
rl.on('line', (line) => {
    console.log(line);
});`,
};
