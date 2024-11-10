import 'source-map-support'
import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'
import { CfnDocument, StringParameter } from 'aws-cdk-lib/aws-ssm';

interface RunCommandParameter {
  type: string
  description: string
  default?: string
}

interface RunCommandProps {
  contentName: string
  commands: Array<string>
  parameters?: {
    [parameter: string]: {
      type: string
      description: string
      default?: string
    }    
  }
}

class RunCommand extends Construct {
  constructor(scope: Construct, id: string, props: RunCommandProps) {
    super(scope, id)
    new CfnDocument(this, 'Default', {
      documentType: 'Command',
      content: {
        schemaVersion: '2.2',
        description: 'test',
        parameters: props.parameters ?? undefined,
        mainSteps: [{
          action: 'aws:runShellScript',
          name: props.contentName,
          inputs: {
            runCommand: props.commands
          }
        }]
      }
    })
  }
}

export class RunCommandStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new RunCommand(this, 'SetupMysql', {
      contentName: 'SetupMysql',
      commands: [
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
        './mysql_secure_installation_auto.exp',
        'rm ./mysql_secure_installation_auto.exp'
      ]
    })

    new RunCommand(this, 'SetupMysqlTestData', {
      contentName: 'SetupMysqlTestData',
      commands: [
        'cat <<EOF > create_test_data.sql',
        'CREATE DATABASE IF NOT EXISTS library;',
        'USE library;',
        'CREATE TABLE IF NOT EXISTS books (',
        '    book_id INT AUTO_INCREMENT PRIMARY KEY,',
        '    title VARCHAR(200) NOT NULL,',
        '    author VARCHAR(100) NOT NULL,',
        '    genre VARCHAR(50),',
        '    published_year YEAR,',
        '    price DECIMAL(8,2),',
        '    stock INT DEFAULT 0,',
        '    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        ') ENGINE=InnoDB;',
        'INSERT INTO books (title, author, genre, published_year, price, stock) VALUES',
        `('吾輩は猫である', '夏目 漱石', '小説', 1905, 500.00, 30),`,
        `('走れメロス', '太宰 治', '短編小説', 1940, 300.00, 50),`,
        `('1Q84', '村上 春樹', '小説', 2009, 1500.00, 20),`,
        `('銀河鉄道の夜', '宮沢 賢治', 'ファンタジー', 1934, 400.00, 40),`,
        `('ノルウェイの森', '村上 春樹', '小説', 1987, 1200.00, 25),`,
        `('コンビニ人間', '村田 沙耶香', '小説', 2016, 800.00, 35),`,
        `('沈黙', '遠藤 周作', '歴史小説', 1966, 1000.00, 15),`,
        `('告白', '湊 かなえ', 'ミステリー', 2008, 700.00, 45),`,
        `('図書館戦争', '有川 浩', 'ライトノベル', 2008, 600.00, 60),`,
        `('火花', '又吉 直樹', '小説', 2015, 900.00, 20);`,
        // `CREATE USER 'replica_user'@'%' IDENTIFIED BY 'your_new_password';`,
        // `GRANT REPLICATION SLAVE ON *.* TO 'replica_user'@'%';`,
        'EOF',
        'cat <<EOF > create_test_data.exp',
        '#!/usr/bin/expect -f',
        'spawn mysql -u root -p',
        'expect "Enter password:"',
        'send "your_new_password\r"',
        'expect "mysql>"',
        'send "source create_test_data.sql;\r"',
        'expect "mysql>"',
        'send "exit\r"',
        'expect eof',
        'EOF',
        'chmod +x create_test_data.exp',
        './create_test_data.exp',
        'rm ./create_test_data.exp',
        'rm ./create_test_data.sql'
      ]
    })

    new RunCommand(this, 'SetupMysqlServerId', {
      contentName: 'SetupMysqlServerId',
      commands: [
        'SERVER_ID=$(hostname | cut -d \'.\' -f 1 | cut -d \'-\' -f 5)',
        'expect << EOF',
        'spawn mysql -u root -p',
        'expect "Enter password:"',
        'send "your_new_password\\r"',
        'expect "mysql>"',
        'send "SET GLOBAL server_id = ${SERVER_ID};\\r"',
        'expect "mysql>"',
        'send "exit\\r"',
        'expect eof',
        'EOF'
      ]
    })

    new RunCommand(this, 'SetupMysqlReplicateUser', {
      contentName: 'SetupMysqlReplicateUser',
      commands: [
        'expect << EOF',
        'spawn mysql -u root -p',
        'expect "Enter password:"',
        'send "your_new_password\\r"',
        'expect "mysql>"',
        'send " CREATE USER \'replica_user\'@\'%\' IDENTIFIED BY \'your_new_password\';\\r"',
        'expect "mysql>"',
        'send " GRANT REPLICATION SLAVE ON *.* TO \'replica_user\'@\'%\';\\r"',
        'expect "mysql>"',
        'send "exit\\r"',
        'expect eof',
        'EOF'
      ]
    })

    new RunCommand(this, 'MysqlShowMasterStatus', {
      contentName: 'MysqlShowMasterStatus',
      commands: [
        'expect << EOF',
        'spawn mysql -u root -p',
        'expect "Enter password:"',
        'send "your_new_password\\r"',
        'expect "mysql>"',
        'send "FLUSH TABLES WITH READ LOCK;\\r"',
        'expect "mysql>"',
        'send "SHOW MASTER STATUS;\\r"',
        'expect "mysql>"',
        'send "exit\\r"',
        'expect eof',
        'EOF'
      ]
    })

    new RunCommand(this, 'SetupMysqlReplication', {
      contentName: 'SetupMysqlReplication',
      parameters: {
        sourceHost: {
          type: 'String',
          description: 'SOURCE_HOST',
          default: 'ip-10-10-0-xxx.ap-northeast-1.compute.internal'
        },
        sourceLogFile: {
          type: 'String',
          description: 'SOURCE_LOG_FILE',
          default: 'binlog.000001'
        },
        sourceLogPos: {
          type: 'String',
          description: 'SOURCE_LOG_POS',
          default: '796'
        }
      },
      commands: [
        'SOURCE_HOST={{ sourceHost }}',
        'SOURCE_LOG_FILE={{ sourceLogFile }}',
        'SOURCE_LOG_POS={{ sourceLogPos }}',
        'cat <<EOF > change_replication_source_to.sql',
        'CHANGE REPLICATION SOURCE TO',
        '    SOURCE_HOST=\'${SOURCE_HOST}\',',
        '    SOURCE_USER=\'replica_user\',',
        '    SOURCE_PASSWORD=\'your_new_password\',',
        '    SOURCE_PORT=3306,',
        '    SOURCE_LOG_FILE=\'${SOURCE_LOG_FILE}\',',
        '    SOURCE_LOG_POS=${SOURCE_LOG_POS},',
        '    SOURCE_CONNECT_RETRY=10;',
        'START REPLICA USER=\'replica_user\' PASSWORD=\'your_new_password\';',
        'EOF',
        'cat <<EOF > change_replication_source_to.exp',
        '#!/usr/bin/expect -f',
        'spawn mysql -u root -p',
        'expect "Enter password:"',
        'send "your_new_password\r"',
        'expect "mysql>"',
        'send "source change_replication_source_to.sql;\r"',
        'expect "mysql>"',
        'send "exit\r"',
        'expect eof',
        'EOF',
        'chmod +x change_replication_source_to.exp',
        './change_replication_source_to.exp',
        'rm ./change_replication_source_to.exp',
        'rm ./change_replication_source_to.sql'
      ]
    })
  }
}