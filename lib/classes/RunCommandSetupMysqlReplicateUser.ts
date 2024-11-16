import RunCommandTemplate from './RunCommandTemplate'
export class RunCommandSetupMysqlReplicateUser extends RunCommandTemplate {
  contentName() {
    return "SetupMysql"
  }
  commands(): Array<string> {
    return [
      'mysql -u root -pyour_new_password --execute "CREATE USER \'replica_user\'@\'%\' IDENTIFIED BY \'your_new_password\';"',
      'mysql -u root -pyour_new_password --execute "GRANT REPLICATION SLAVE ON *.* TO \'replica_user\'@\'%\';"',
      'mysql -u root -pyour_new_password --execute "SELECT Host, User FROM mysql.user WHERE user = \'replica_user\'"',
      'mysql -u root -pyour_new_password --execute "SHOW GRANTS FOR \'replica_user\'@\'%\';"'
    ]
  }
}