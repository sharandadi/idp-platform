import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        }
    }

    private cleanOutput(code: string): string {
        // Remove Markdown Code Block Fences
        code = code.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '');
        // Remove top-level comments but protect URLs
        code = code.replace(/(^|[^:])\/\/.*$/gm, '$1');
        code = code.replace(/(^|[^:])#.*$/gm, '$1');
        return code.trim();
    }

    async generateCode(prompt: string, language?: string) {
        if (!this.model) return '// Error: GEMINI_API_KEY not configured';
        const languageContext = language ? `in ${language}` : 'in the most appropriate language';
        try {
            const result = await this.model.generateContent(`
                You are an expert developer. Write code ${languageContext} for: "${prompt}".
                RULES: Return ONLY raw code. No markdown.
            `);
            return this.cleanOutput(result.response.text());
        } catch (error) { return `// Error: ${error.message}`; }
    }

    async generateTests(code: string, language?: string) {
        if (!this.model) return '// Error: GEMINI_API_KEY not configured';
        try {
            const result = await this.model.generateContent(`
                You are a QA Engineer. Write unit tests for: "${code}".
                RULES: Return ONLY raw test code. No markdown.
            `);
            return this.cleanOutput(result.response.text());
        } catch (error) { return `// Error: ${error.message}`; }
    }

    // Method 1: Generates just the Script (For Frontend Pipeline Tab)
    async generateJenkinsfile(contextCode: string, customRequirements: string = '', language?: string) {
        if (!this.model) return '// Error: GEMINI_API_KEY not configured';
        const languageContext = language ? `for a ${language} project` : 'detecting language';
        try {
            const result = await this.model.generateContent(`
                You are a DevOps Engineer. Write a declarative Jenkinsfile ${languageContext}.
                Requirements: "${customRequirements}"
                Code: "${contextCode}"
                
                CRITICAL RULES:
                1. DO NOT use 'git' or 'checkout'. The code is injected via parameters.
                2. Use 'writeFile file: "filename", text: params.SOURCE_CODE' to create source files.
                3. Use 'writeFile file: "testfile", text: params.TEST_CODE' to create test files.
                4. For Python, use 'python3'. For Node, use 'node'.
                5. Return ONLY raw Jenkinsfile content. No markdown.
            `);
            return this.cleanOutput(result.response.text());
        } catch (error) { return `// Error: ${error.message}`; }
    }

    // Method 2: Generates the Full XML (For Backend Auto-Provisioning)
    async generateJobXml(contextCode: string, customRequirements: string = '') {
        if (!this.model) return '';
        try {
            const result = await this.model.generateContent(`
                You are a Jenkins Expert. Generate a COMPLETE 'config.xml' for a Pipeline Job.
                Code: "${contextCode}"
                Requirements: "${customRequirements}"
                
                CRITICAL RULES:
                1. DO NOT add a Git SCM definition. DO NOT use 'git checkout'.
                2. The pipeline MUST accept 'SOURCE_CODE' and 'TEST_CODE' as string parameters.
                3. In the pipeline script, you MUST write these parameters to files using 'writeFile'.
                   Example: writeFile file: 'main.py', text: params.SOURCE_CODE
                4. Root element must be <flow-definition plugin="workflow-job">.
                5. Wrap script in <script><![CDATA[ ... ]]></script>.
                6. For Python stages, use 'python3' command directly.
                7. Return ONLY the XML string. No markdown.
            `);
            return this.cleanOutput(result.response.text());
        } catch (error) { throw new Error(error.message); }
    }
}