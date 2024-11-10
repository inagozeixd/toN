import 'source-map-support'
import { Construct } from 'constructs'
import { Stack, StackProps, CfnOutput, Tags } from 'aws-cdk-lib'
import { Instance, InstanceType, InstanceClass, InstanceSize, GenericLinuxImage, UserData, Vpc, SubnetSelection, SubnetType, SecurityGroup, IPeer, Port, Peer } from 'aws-cdk-lib/aws-ec2'
import { Role, IRole, ManagedPolicy, ServicePrincipal } from 'aws-cdk-lib/aws-iam'

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

    const sourceSecurityGroup = new SecurityGroup(this, 'SourceSecurityGroup', {
      securityGroupName: 'source-sg',
      vpc: vpc
    })

    const replicaSecurityGroup = new SecurityGroup(this, 'ReplicaSecurityGroup', {
      securityGroupName: 'replica-sg',
      vpc: vpc
    })
    sourceSecurityGroup.addIngressRule(Peer.securityGroupId(replicaSecurityGroup.securityGroupId), Port.MYSQL_AURORA)

    const sourceProps: EC2Props = {
      vpc: vpc,
      role: role,
      subnetSelection: { subnetType: SubnetType.PUBLIC },
      securityGroup: sourceSecurityGroup
    }
    const source = new EC2(this, 'Source', sourceProps)

    const replicaProps: EC2Props = {
      vpc: vpc,
      role: role,
      subnetSelection: { subnetType: SubnetType.PUBLIC },
      securityGroup: replicaSecurityGroup
    }
    const replica1 = new EC2(this, 'Replica1', replicaProps)
    const replica2 = new EC2(this, 'Replica2', replicaProps)
  }
}