import 'source-map-support'
// CDK Import
import { App } from 'aws-cdk-lib'
import { VPCStack } from '../lib/VPCStack'
import { EC2Stack } from '../lib/EC2Stack'
import { RunCommandStack } from '../lib/RunCommandStack'
// SDK Import
import { SSMClient, SendCommandCommand} from '@aws-sdk/client-ssm'
import * as outputs from '../outputs.json'

// CDK
const app = new App()
const vpcStack = new VPCStack(app, 'VPC')
const ec2Stack = new EC2Stack(app, 'EC2', {
  vpc: vpcStack.vpc
})
const runCommandStack = new RunCommandStack(app, 'RunCommand')

// SDK
// const client = new SSMClient()
// const params = {
//   DocumentName: outputs.RunCommandStack['ec2-install-mysql-runcommand'],
//   InstanceIds: outputs.EC2Stack['MysqlInstanceIds'].split(',')
// }
// const command = new SendCommandCommand(params)
// const response = client.send(command)