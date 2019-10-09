module.exports = {
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'GitHub', link: 'https://github.com/xiaop1ng/PlayWithMySQL' },
    ], // 导航栏
	sidebar: [
      ['/', 'Home'],
	  ['/doc/create-db-playground', '创建实验场'],
      ['/doc/about-db-index', '索引'],
      ['/doc/about-db-explain', '执行计划']
    ], // 侧栏
	lastUpdated: 'Last Updated', // 最后更新时间
	
  }
}