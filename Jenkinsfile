pipeline {
    agent any

    environment {
        SONAR_TOKEN = '966a5b64d7641a61e3f43aa88a282e5b40e3e84e'
    }

    stages {
        stage('Instalar Dependencias') {
            steps {
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
                // Usamos el comando exacto que ya validamos para mantener tus 2.5k líneas
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
                sh 'docker build -t backend-tailorflow .'
            }
        }
    }
}