import 'source-map-support'
import { Construct } from 'constructs'
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib'
import { Instance, InstanceType, InstanceClass, InstanceSize, GenericLinuxImage, Vpc, SubnetSelection, SubnetType, SecurityGroup, IPeer, Port, Peer } from 'aws-cdk-lib/aws-ec2'
import { Role, IRole } from 'aws-cdk-lib/aws-iam'

interface EC2StackProps extends StackProps {
  vpc: Vpc
}

interface EC2Props {
  vpc: Vpc
  role: IRole
  subnetSelection: SubnetSelection
  securityGroup: SecurityGroup
}

class EC2 extends Construct {
  public readonly instanceId: string
  constructor (scope: Construct, id: string, props: EC2Props) {
    super(scope, id)
    const ec2 = new Instance(this, 'Default', {
      instanceName: id.charAt(0).toLowerCase() + id.slice(1),
      associatePublicIpAddress: true,
      instanceType: InstanceType.of(InstanceClass.T3A, InstanceSize.SMALL),
      machineImage: new GenericLinuxImage({'ap-northeast-1': 'ami-0c02144aaa772139c'}),
      vpc: props.vpc,
      vpcSubnets: props.subnetSelection,
      role: props.role,
      securityGroup: props.securityGroup
    })
    this. instanceId = ec2.instanceId
  }
}

export class EC2Stack extends Stack {

  constructor(scope: Construct, id: string, props: EC2StackProps) {
    super(scope, id, props);

    const vpc = props.vpc

    const role = Role.fromRoleName(this, 'FromRoleName', 'AmazonSSMManagedInstanceCoreRole')

    const sg = new SecurityGroup(this, 'SecurityGroup', {
      securityGroupName: 'ec2-sg',
      vpc: vpc
    })
    sg.addIngressRule(Peer.anyIpv4(), Port.SSH)

    const ec2Props: EC2Props = {
      vpc: vpc,
      role: role,
      subnetSelection: { subnetType: SubnetType.PUBLIC },
      securityGroup: sg
    }
    const source = new EC2(this, 'Source', ec2Props)
    const replica1 = new EC2(this, 'Replica1', ec2Props)
    const replica2 = new EC2(this, 'Replica2', ec2Props)

    new CfnOutput(this, 'MysqlInstanceIds', {
      value: [source.instanceId, replica1.instanceId, replica2.instanceId].join(','),
      exportName: 'MysqlInstanceIds'
    })
  }

  // private createStackSuffix(): string {
  //   const stackId = this.stackId;
  //   const shortStackId = Fn.select(2, Fn.split('/', stackId));
  //   const stackSuffix = Fn.select(4, Fn.split('-', shortStackId));
  //   return stackSuffix;
  // }
}