import RunCommandTemplate from './RunCommandTemplate'
export class RunCommandSetupMysql extends RunCommandTemplate {
  contentName() {
    return "SetupMysql"
  }
  commands(): Array<string> {
    return [
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
  }
}