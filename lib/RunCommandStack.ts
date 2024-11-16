import 'source-map-support'
import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'
import { RunCommandSetupMysql } from './classes/RunCommandSetupMysql'
import { RunCommandSetupMysqlReplicateUser } from './classes/RunCommandSetupMysqlReplicateUser'
import { RunCommandMysqlShowMasterStatus } from './classes/RunCommandMysqlShowMasterStatus'
import { RunCommandSetupMysqlReplication } from './classes/RunCommandSetupMysqlReplication'
import { RunCommandSetupMysqlTestData } from './classes/RunCommandSetupMysqlTestData'

export class RunCommandStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new RunCommandSetupMysql().create(this, 'SetupMysql')
    new RunCommandSetupMysqlReplicateUser().create(this, 'SetupMysqlReplicateUser')
    new RunCommandMysqlShowMasterStatus().create(this, 'MysqlShowMasterStatus')
    new RunCommandSetupMysqlReplication().create(this, 'SetupMysqlReplication')
    new RunCommandSetupMysqlTestData().create(this, 'SetupMysqlTestData')
  }

}