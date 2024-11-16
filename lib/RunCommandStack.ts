import 'source-map-support'
import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'
import { CfnDocument, StringParameter } from 'aws-cdk-lib/aws-ssm';

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
        'expect << EOF',
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
        'SERVER_ID=$(hostname | cut -d \'.\' -f 1 | cut -d \'-\' -f 5)',
        'mysql -u root -pyour_new_password --execute "SET GLOBAL server_id = ${SERVER_ID};"',
        'mysql -u root -pyour_new_password --execute "SET PERSIST server_id = ${SERVER_ID};"',
        'sudo cat /var/lib/mysql/mysqld-auto.cnf',
        'mysql -u root -pyour_new_password --execute "SELECT * FROM performance_schema.persisted_variables;"',
        'mysql -u root -pyour_new_password --execute "SHOW VARIABLES LIKE \'server_id\';"'
      ]
    })

    // # FIXME: 長いコマンドはこうして配列格納してあとで.join等するようにしたほうが読みやすいと思う。ご意見ください。
    const createTableCommands: Array<string> = [
      'CREATE TABLE IF NOT EXISTS books (',
      'book_id INT AUTO_INCREMENT PRIMARY KEY,',
      'title VARCHAR(200) NOT NULL,',
      'author VARCHAR(100) NOT NULL,',
      'genre VARCHAR(50),',
      'published_year YEAR,',
      'price DECIMAL(8,2),',
      'stock INT DEFAULT 0,',
      'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      ') ENGINE=InnoDB;'
    ]
    // # FIXME: 長いコマンドはこうして配列格納してあとで.join等するようにしたほうが読みやすいと思う。ご意見ください。
    const insertIntoCommands: Array<string> = [
      'INSERT INTO books (title, author, genre, published_year, price, stock) VALUES ',
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
    ]
    new RunCommand(this, 'SetupMysqlTestData', {
      contentName: 'SetupMysqlTestData',
      commands: [
        'mysql -u root -pyour_new_password --execute "CREATE DATABASE IF NOT EXISTS library;"',
        `mysql -u root -pyour_new_password library --execute "${createTableCommands.join('')}"`,
        `mysql -u root -pyour_new_password library --execute "${insertIntoCommands.join('')}"`,
        'mysql -u root -pyour_new_password --execute "SHOW DATABASES;"',
        'mysql -u root -pyour_new_password library --execute "SHOW TABLES;"'
      ]
    })

    new RunCommand(this, 'SetupMysqlReplicateUser', {
      contentName: 'SetupMysqlReplicateUser',
      commands: [
        'mysql -u root -pyour_new_password --execute "CREATE USER \'replica_user\'@\'%\' IDENTIFIED BY \'your_new_password\';"',
        'mysql -u root -pyour_new_password --execute "GRANT REPLICATION SLAVE ON *.* TO \'replica_user\'@\'%\';"',
        'mysql -u root -pyour_new_password --execute "SELECT Host, User FROM mysql.user WHERE user = \'replica_user\'"',
        'mysql -u root -pyour_new_password --execute "SHOW GRANTS FOR \'replica_user\'@\'%\';"'
      ]
    })

    new RunCommand(this, 'MysqlShowMasterStatus', {
      contentName: 'MysqlShowMasterStatus',
      commands: [
        'mysql -u root -pyour_new_password --execute "FLUSH TABLES WITH READ LOCK;"',
        'mysql -u root -pyour_new_password --execute "SHOW MASTER STATUS;"'
      ]
    })

    // # FIXME: 長いコマンドはこうして配列格納してあとで.join等するようにしたほうが読みやすいと思う。ご意見ください。
    const replicationCommands: Array<string> = [
      'CHANGE REPLICATION SOURCE TO ',
      'SOURCE_HOST=\'${SOURCE_HOST}\',',
      'SOURCE_USER=\'replica_user\',',
      'SOURCE_PASSWORD=\'your_new_password\',',
      'SOURCE_PORT=3306,',
      'SOURCE_LOG_FILE=\'${SOURCE_LOG_FILE}\',',
      'SOURCE_LOG_POS=${SOURCE_LOG_POS},',
      'SOURCE_CONNECT_RETRY=10;'
    ]

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
        `mysql -u root -pyour_new_password --execute "${replicationCommands.join('')}"`,
        'mysql -u root -pyour_new_password --execute "START REPLICA USER=\'replica_user\' PASSWORD=\'your_new_password\';"',
        'mysql -u root -pyour_new_password --execute "SHOW REPLICA STATUS\G"'
      ]
    })
  }
}