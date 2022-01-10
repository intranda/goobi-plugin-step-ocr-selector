pipeline {
  agent {
    docker {
      image 'maven:3-jdk-8'
      args '-v $HOME/.m2/root/.m2'
    }
  }

  stages {
    stage('build') {
      steps {
        sh 'mvn -f plugin/pom.xml package'
      }
    }
  }
  post {
    success {
      archiveArtifacts artifacts: 'plugin/INSTALL.md, plugin/target/plugin_intranda_step_ocrselector.tar', fingerprint:
      true
    }
  }
}
