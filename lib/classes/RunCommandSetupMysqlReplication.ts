import RunCommandTemplate from './RunCommandTemplate'
import { RunCommandParameters } from "../../types/RunCommandTypes"

export class RunCommandSetupMysqlReplication extends RunCommandTemplate {
  contentName() {
    return "SetupMysql"
  }
  parameters(): RunCommandParameters | undefined {
    return {
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
    }
  }
  commands(): Array<string> {
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
    return [
      'SOURCE_HOST={{ sourceHost }}',
      'SOURCE_LOG_FILE={{ sourceLogFile }}',
      'SOURCE_LOG_POS={{ sourceLogPos }}',
      `mysql -u root -pyour_new_password --execute "${replicationCommands.join('')}"`,
      'mysql -u root -pyour_new_password --execute "START REPLICA USER=\'replica_user\' PASSWORD=\'your_new_password\';"',
      'mysql -u root -pyour_new_password --execute "SHOW REPLICA STATUS\\G"'
    ]
  }
}