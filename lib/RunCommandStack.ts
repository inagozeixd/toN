import 'source-map-support'
import { Construct } from 'constructs'
import { Stack, StackProps, Fn, CfnOutput } from 'aws-cdk-lib'
import { CfnDocument } from 'aws-cdk-lib/aws-ssm';

export class RunCommandStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const document = new CfnDocument(this, 'Document', {
      name: `ec2-install-mysql-runcommand-${this.createStackSuffix()}`,
      documentType: 'Command',
      content: {
        schemaVersion: '2.2',
        description: 'test',
        mainSteps: [{
          action: 'aws:runShellScript',
          name: 'InstallMysql',
          inputs: {
            runCommand: [
              'sudo su - ec2-user',
              'sudo dnf update -y',
              'sudo dnf install -y https://dev.mysql.com/get/mysql80-community-release-el8-1.noarch.rpm',
              'sudo dnf install -y mysql-server',
              'sudo systemctl start mysqld',
              'sudo systemctl enable mysqld',
              'sudo dnf install -y epel-release',
              'sudo dnf install -y expect',
              'cat <<EOF > mysql_secure_installation_auto.exp',
              '#!/usr/bin/expect -f',
              'set timeout 10',
              'spawn sudo mysql_secure_installation',
              'expect "Enter password for user root:"',
              'send "\r"',
              'expect "New password:"',
              'send "your_new_password\r"',
              'expect "Re-enter new password:"',
              'send "your_new_password\r"',
              'expect "Remove anonymous users? (Press y|Y for Yes, any other key for No) :"',
              'send "y\r"',
              'expect "Disallow root login remotely? (Press y|Y for Yes, any other key for No) :"',
              'send "y\r"',
              'expect "Remove test database and access to it? (Press y|Y for Yes, any other key for No) :"',
              'send "y\r"',
              'expect "Reload privilege tables now? (Press y|Y for Yes, any other key for No) :"',
              'send "y\r"',
              'expect eof',
              'EOF',
              'chmod +x mysql_secure_installation_auto.exp',
              './mysql_secure_installation_auto.exp'
            ]
          }
        }]
      }
    })

    new CfnOutput(this, 'DocumentName', {
      value: document.name!,
      exportName: 'ec2-install-mysql-runcommand'
    })
  }

  private createStackSuffix(): string {
    const stackId = this.stackId;
    const shortStackId = Fn.select(2, Fn.split('/', stackId));
    const stackSuffix = Fn.select(4, Fn.split('-', shortStackId));
    return stackSuffix;
  }
}