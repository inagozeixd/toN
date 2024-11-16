# 概要
EC2を使ったmysql検証環境を構築する

# 使い方

##

## RunCommandの実行順序
1. SetupMysql
  * 実行対象: source, replica
2. SetupMysqlReplicateUser
  * 実行対象: source
3. SetupMysqlServerId
  * 実行対象: source, repilca
4. MysqlShowMasterStatus
  * 実行対象: source
5. SetupMysqlReplication
  * 実行対象: replica 
  * 備考: パラメーター入力有 MysqlShowMasterStatusで確認したSOURCE_LOG_FILEとSOURCE_LOG_POSを入力して、sourceのPrivateDNS名を入力して実行
6. SetupMysqlTestData
  * 実行対象: source