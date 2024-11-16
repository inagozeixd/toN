import RunCommandTemplate from './RunCommandTemplate'
export class RunCommandMysqlShowMasterStatus extends RunCommandTemplate {
  contentName() {
    return "SetupMysql"
  }
  commands(): Array<string> {
    return [
      'mysql -u root -pyour_new_password --execute "FLUSH TABLES WITH READ LOCK;"',
      'mysql -u root -pyour_new_password --execute "SHOW MASTER STATUS;"'
    ]
  }
}