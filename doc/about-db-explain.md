# 执行计划

上一篇中介绍了索引，从结果上看，一个查询走索引和不走索引的查询效率的差别，当然这个也很好理解。

生活中的例子有：我们通过各种字典去查单词、生字、成语之类的；在图书馆里每一本书会有一个索引号（A-Z 开头），
同时对图书进行分类，把不同分类的书籍摆放到不同的楼层和区域；在奶茶门店里店员会将顾客下单的饮品按订单的取茶号（1-9 开头）
放置在一个取茶的标识架（标识 1-9）里面。

所以在业务系统里面，给经常被搜索的字段加上索引是非常有必要的事情，然而，有时候我们明明建立了索引，但是查询依旧缓慢。这个
时候我们就需要使用执行计划了，查询执行计划来查看数据库查询时是否走了索引。

### 使用 explain 查看 mysql 执行计划

`explain` 适用于 `select`, `insert`, `update` 和 `delete` 语句

```mysql
explain select * from `user` where user_sn = '826104d6e34b11e9be1768f72847b82b';

+----+-------------+-------+------------+-------+-------------------------+-------------------------+---------+-------+------+----------+-------+
| id | select_type | table | partitions | type  | possible_keys           | key                     | key_len | ref   | rows | filtered | Extra |
+----+-------------+-------+------------+-------+-------------------------+-------------------------+---------+-------+------+----------+-------+
|  1 | SIMPLE      | user  | NULL       | const | unique_key_user_user_sn | unique_key_user_user_sn | 99      | const |    1 |      100 | NULL  |
+----+-------------+-------+------------+-------+-------------------------+-------------------------+---------+-------+------+----------+-------+
```

- id 查询序列号
- select_type 查询类型
- table 输出所引用的表
- partitions 匹配的分区
- type 连接使用的类型

> 结果值从好到坏依次是：
system > const > eq_ref > ref > fulltext > ref_or_null > index_merge > unique_subquery > index_subquery > range > index > ALL > UNKNOWN
也就是说 type 记录了是否使用了索引还是全表扫描，const, eg_reg, ref, range, index, ALL
一般来说，得保证查询至少达到 range 级别，最好能达到 ref，否则就可能会出现性能问题。

- possible_keys 指出使用到那些索引有助于查询
- key 实际选择的索引
- key_len 使用索引的长度。在不损失精确性的情况下，长度越短越好
- ref 显示索引的那一列被使用了
- rows 请求数据的行数
- filtered 按表条件过滤行的百分比
- Extra 附件信息

> 特别的 explain 不会考虑 cache；不能显示 mysql 在执行查询时所作的优化工作；部分统计信息是估算的。

我们删掉 `user_sn` 上所有的索引，然后查看一下执行计划

```mysql
explain select * from `user` where user_sn = '826104d6e34b11e9be1768f72847b82b';

+----+-------------+-------+------------+------+---------------+------+---------+------+--------+----------+-------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows   | filtered | Extra       |
+----+-------------+-------+------------+------+---------------+------+---------+------+--------+----------+-------------+
|  1 | SIMPLE      | user  | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 994143 |       10 | Using where |
+----+-------------+-------+------------+------+---------------+------+---------+------+--------+----------+-------------+
```

我们可以看到没有索引的时候 type 为 ALL，也就是全表扫描。 key 是 NULL，也就是说这个查询没有使用到任何索引。

删掉 `user_sn` 上所有的索引然后在 `user_sn` 建立唯一索引，再查看执行计划：

```mysql
explain select * from `user` where user_sn = '826104d6e34b11e9be1768f72847b82b';

+----+-------------+-------+------------+-------+-------------------------+-------------------------+---------+-------+------+----------+-------+
| id | select_type | table | partitions | type  | possible_keys           | key                     | key_len | ref   | rows | filtered | Extra |
+----+-------------+-------+------------+-------+-------------------------+-------------------------+---------+-------+------+----------+-------+
|  1 | SIMPLE      | user  | NULL       | const | unique_key_user_user_sn | unique_key_user_user_sn | 99      | const |    1 |      100 | NULL  |
+----+-------------+-------+------------+-------+-------------------------+-------------------------+---------+-------+------+----------+-------+
```

加了唯一索引之后，type 为 const，key 为 unique_key_user_user_sn 表明这个查询使用到了该索引。


删掉 `user_sn` 上所有的索引然后在 `user_sn` 建立索引，再查看执行计划：

```mysql
explain select * from `user` where user_sn = '826104d6e34b11e9be1768f72847b82b';

+----+-------------+-------+------------+------+------------------+------------------+---------+-------+------+----------+-------+
| id | select_type | table | partitions | type | possible_keys    | key              | key_len | ref   | rows | filtered | Extra |
+----+-------------+-------+------------+------+------------------+------------------+---------+-------+------+----------+-------+
|  1 | SIMPLE      | user  | NULL       | ref  | key_user_user_sn | key_user_user_sn | 99      | const |    1 |      100 | NULL  |
+----+-------------+-------+------------+------+------------------+------------------+---------+-------+------+----------+-------+
```

加了索引之后，type 为 ref 为 key_user_user_sn 表明这个查询使用到了该索引。
