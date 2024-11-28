echo 
echo ----------------------------------------------------------------------
echo robot indice ***************************
echo ----------------------------------------------------------------------
echo inicializando tablas ...
@mysql -vvvvv -u admin -pzyx**EzugOBhWWfTqb??hlvb08XAN606Oi -h 172.26.0.4 -e "truncate table robot_repositorio_indice;" homi
echo Cargando ....

@mysql -vvvvv -u admin -pzyx**EzugOBhWWfTqb??hlvb08XAN606Oi -h 172.26.0.4 -e "SET NAMES utf8;SET CHARACTER SET utf8;" homi
@mysql -vvvvv -u admin -pzyx**EzugOBhWWfTqb??hlvb08XAN606Oi -h 172.26.0.4 -e "SET GLOBAL local_infile=1;" homi
@mysql -vvvvv -u admin -pzyx**EzugOBhWWfTqb??hlvb08XAN606Oi -h 172.26.0.4 --local-infile=1	 -e  "LOAD DATA LOCAL INFILE 'files.csv' INTO TABLE robot_repositorio_indice CHARACTER SET utf8mb4 FIELDS TERMINATED BY ';'; SHOW WARNINGS;" homi
@mysql -vvvvv -u admin -pzyx**EzugOBhWWfTqb??hlvb08XAN606Oi -h 172.26.0.4 -e "call etlRobotRepositorioIndice	();" homi