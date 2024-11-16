import { CfnDocument } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { RunCommandParameters } from "../../types/RunCommandTypes"

export default abstract class RunCommandTemplate {
  abstract contentName(): string;
  // # FIXME: 長いコマンドはこうして配列格納してあとで.join等するようにしたほうが読みやすいと思う。ご意見ください。 ※詳細は各子クラスを参照ください。
  abstract commands(): Array<string>
  parameters() : RunCommandParameters | undefined {
    return undefined
  }

  create(scope: Construct, id: string): void {
    new CfnDocument(scope, id, {
      documentType: 'Command',
      content: {
        schemaVersion: '2.2',
        description: `RunCommand for ${this.contentName()}`,
        parameters: this.parameters(),
        mainSteps: [{
          action: 'aws:runShellScript',
          name: this.contentName(),
          inputs: {
            runCommand: this.commands()
          }
        }]
      }
    })
  }
}