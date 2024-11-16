import RunCommandTemplate from './RunCommandTemplate'
export class RunCommandSetupMysqlTestData extends RunCommandTemplate {
  contentName() {
    return "SetupMysql"
  }
  commands(): Array<string> {
    const createTableCommands: Array<string> = [
      'CREATE TABLE IF NOT EXISTS books (',
      'book_id INT AUTO_INCREMENT PRIMARY KEY,',
      'title VARCHAR(200) NOT NULL,',
      'author VARCHAR(100) NOT NULL,',
      'genre VARCHAR(50),',
      'published_year YEAR,',
      'price DECIMAL(8,2),',
      'stock INT DEFAULT 0,',
      'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      ') ENGINE=InnoDB;'
    ]
    const insertIntoCommands: Array<string> = [
      'INSERT INTO books (title, author, genre, published_year, price, stock) VALUES ',
      `('吾輩は猫である', '夏目 漱石', '小説', 1905, 500.00, 30),`,
      `('走れメロス', '太宰 治', '短編小説', 1940, 300.00, 50),`,
      `('1Q84', '村上 春樹', '小説', 2009, 1500.00, 20),`,
      `('銀河鉄道の夜', '宮沢 賢治', 'ファンタジー', 1934, 400.00, 40),`,
      `('ノルウェイの森', '村上 春樹', '小説', 1987, 1200.00, 25),`,
      `('コンビニ人間', '村田 沙耶香', '小説', 2016, 800.00, 35),`,
      `('沈黙', '遠藤 周作', '歴史小説', 1966, 1000.00, 15),`,
      `('告白', '湊 かなえ', 'ミステリー', 2008, 700.00, 45),`,
      `('図書館戦争', '有川 浩', 'ライトノベル', 2008, 600.00, 60),`,
      `('火花', '又吉 直樹', '小説', 2015, 900.00, 20);`,
    ]
    return [
      'mysql -u root -pyour_new_password --execute "CREATE DATABASE IF NOT EXISTS library;"',
      `mysql -u root -pyour_new_password library --execute "${createTableCommands.join('')}"`,
      `mysql -u root -pyour_new_password library --execute "${insertIntoCommands.join('')}"`,
      'mysql -u root -pyour_new_password --execute "SHOW DATABASES;"',
      'mysql -u root -pyour_new_password library --execute "SHOW TABLES;"'
    ]
  }
}