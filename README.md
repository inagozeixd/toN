# 概要
EC2を使ったmysql検証環境を構築する

# 使い方

## RunCommandの実行順序
1. SetupMysql
  * 実行対象: source, replica
2. SetupMysqlReplicateUser
  * 実行対象: source
3. MysqlShowMasterStatus
  * 実行対象: source
4. SetupMysqlReplication
  * 実行対象: replica 
  * 備考: パラメーター入力有 MysqlShowMasterStatusで確認しaたSOURCE_LOG_FILEとSOURCE_LOG_POSを入力して、sourceのPrivateDNS名を入力して実行
5. SetupMysqlTestData
  * 実行対象: source

# 設計指針メモ

## mysql server_idの永続性について
`systemctl restart mysqld` を実施すると、`SET GLOBAL`で設定したserver_idが揮発する<br>
本課題に対して当プロジェクトでは、`SET PERSIST`コマンドを使うことで回避する