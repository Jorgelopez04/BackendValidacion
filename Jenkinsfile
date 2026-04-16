pipeline {
    agent any

    /* ESTE BLOQUE ES LA CLAVE: 
       Asegúrate de que 'node20' sea el nombre exacto que pusiste 
       en Administrar Jenkins -> Tools -> NodeJS 
    */
    tools {
        nodejs 'node20' 
    }

    environment {
        // Tu token de SonarQube
        SONAR_TOKEN = '966a5b64d7641a61e3f43aa88a282e5b40e3e84e'
    }

    stages {
        stage('Instalar Dependencias') {
            steps {
                // Ahora Jenkins sí encontrará 'npm' gracias al bloque tools
                sh 'npm install'
            }
        }

        stage('Tests y Cobertura') {
            steps {
                sh 'npm run test:cov'
            }
        }

        stage('Análisis SonarCloud') {
            steps {
                sh """
                npx sonar-scanner \
                -Dsonar.token=${SONAR_TOKEN} \
                -Dsonar.exclusions=src/main.ts,src/**/*.module.ts \
                -Dsonar.coverage.exclusions=src/**/*.controller.ts,src/modules/**/dto/*.dto.ts,src/guards/**,src/common/decorators/**,src/modules/areas/areas.service.ts \
                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                """
            }
        }

        stage('Construir Imagen Docker') {
            steps {
                // Si el agente tiene permisos de Docker, esto funcionará
                sh 'docker build -t backend-tailorflow .'
            }
        }
    }
}