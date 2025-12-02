export const JOB_CONFIG_XML = `
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job">
  <description>Auto-generated IDP Pipeline with Dependency Management</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.StringParameterDefinition>
          <name>SOURCE_CODE</name>
          <description>Application Source Code</description>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>TEST_CODE</name>
          <description>Unit Test Code</description>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>DEPENDENCIES</name>
          <description>Space-separated list of npm packages to install (e.g. 'axios lodash')</description>
          <defaultValue></defaultValue>
          <trim>true</trim>
        </hudson.model.StringParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps">
    <script>
pipeline {
    agent any
    tools {
        nodejs 'NodeJS' 
    }
    stages {
        stage('Initialize Workspace') {
            steps {
                // clean workspace to ensure a fresh build every time
                deleteDir()
                
                // Initialize a fresh package.json
                sh 'npm init -y'
            }
        }
        stage('Install Dependencies') {
            steps {
                script {
                    // Always install Jest for testing
                    // Dynamically install any extra packages requested by the user/AI
                    def deps = params.DEPENDENCIES ?: ""
                    echo "Installing dependencies: jest \${deps}"
                    
                    // npm install will handle both the test runner and the user's libraries
                    sh "npm install jest \${deps} --save-dev"
                }
            }
        }
        stage('Inject Code') {
            steps {
                // Write the code from parameters to files
                writeFile file: 'index.js', text: params.SOURCE_CODE
                writeFile file: 'index.test.js', text: params.TEST_CODE
            }
        }
        stage('Run Tests') {
            steps {
                // Run Jest, ensuring we don't fail just because no tests were found (for empty runs)
                sh 'npx jest index.test.js --passWithNoTests --colors'
            }
        }
    }
}
    </script>
    <sandbox>true</sandbox>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
`.trim();