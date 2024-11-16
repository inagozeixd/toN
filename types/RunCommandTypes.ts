export interface RunCommandParameters {
  [parameter: string]: {
    type: string
    description: string
    default?: string
  }    
}