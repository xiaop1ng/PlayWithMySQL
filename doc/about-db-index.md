# 索引

相信细心的小伙伴已经发现了，两个表里面除了主键外均是没有建立索引的。而依据具体的业务我们很容易能发现在 `user_sn` 用户编号上
适合建立唯一索引。如果用户名 `user_name` 和手机号 `phone` 经常会被用于查询用户信息，那么在其字段上建议索引也是合理的。

### 索引的创建与删除

**创建索引**

> CREATE INDEX indexName ON mytable(username(length)); 

> ALTER table tableName ADD INDEX indexName(columnName);

**删除索引**

> DROP INDEX [indexName] ON mytable; 

**唯一索引**
> CREATE UNIQUE INDEX indexName ON mytable(username(length));

> ALTER table tableName ADD UNIQUE [indexName] (username(length));

**显示索引**

> SHOW INDEX FROM tableName;

### 查询用户基本信息

首先为了每次查询都是公平的，我们禁用掉数据库缓存（万万不可拿生产的数据库做此实验）

```mysql
set global query_cache_size=0;
set global query_cache_type=0;
```

业务系统中不宜将自增的 `id` 暴露出去，所以这里选择使用 `user_sn` 来查询对应的用户信息。 

> select * from `user` where user_sn = '826104d6e34b11e9be1768f72847b82b'; -- 1.369s

可以明显的看到这个查询耗时太久了，我们知道 `user_sn` 是非空且唯一的 uuid，所以这里我们加上唯一索引。

> CREATE UNIQUE INDEX unique_key_user_user_sn ON user(user_sn(32)); -- 5.660s

建立好唯一索引之后再来查询一次

> select * from `user` where user_sn = '826104d6e34b11e9be1768f72847b82b'; -- 0.004s

建立了唯一索引之后查询效率提升了 342 倍，这里是基于 100 万数据的查询结果。显而易见的是在加了索引之后的查询不会搜全表，而不加索引的查询会搜全表。


最后试试把唯一索引换成普通的 Btree 索引的查询效率

```mysql
DROP INDEX unique_key_user_user_sn ON user;
CREATE INDEX key_user_user_sn ON user( user_sn(32) );  -- 5.671s
```

> select * from `user` where user_sn = '826104d6e34b11e9be1768f72847b82b'; -- 0.003s

我们这里看到的结果是建立普通索引和唯一索引之后的查询效率是差不多的。
