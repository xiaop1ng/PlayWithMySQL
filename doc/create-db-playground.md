
# 创建一个玩耍的库

一个玩耍的库，所以他的有一定数据量，且有一定代表意义。
所以我们准备创建用户模块的表，这个表拥有 100w 条用户数据。

```mysql
-- 用户表
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_sn` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_name` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `sex` varchar(2) COLLATE utf8_unicode_ci DEFAULT NULL,
  `phone` varchar(16) COLLATE utf8_unicode_ci DEFAULT NULL,
  `create_time` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- 用户密码表
DROP TABLE IF EXISTS `user_pass`;
CREATE TABLE `user_pass` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_sn` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password` varchar(64) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
```

创建 100w 条数据

```mysql
-- 创建一个存储过程，用于循环创建数据
create procedure create_data(a int) 
	begin
        declare i int default 1;
	while i<=a DO -- 循环开始
        insert into `user` value( i, REPLACE( UUID(), '-', '') , i, floor(1+rand()*2), i, now() );
        insert into user_pass value (i, i, md5(i));
        set i=i+1;
	end while; -- 循环结束
	end;

-- 执行存储过程，这里的 1000000 为入参
call create_data(1000000);
-- 删除存储过程
drop procedure if exists create_data;
```

时间: 2432.784s 大约要花 40 多分钟，等不了那么久的同学也可以创建 10w 条数据先耍着。

