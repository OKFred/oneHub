# daemon process for the node app  守护进程，失败自启
## FREDZ @2022
timer=15;   #重试时间间隔
while true ; do
if ! pgrep -f 'node_githubApp.js' > /dev/null; then
    echo 'server (re)start 服务已启动'
    node node_githubApp.js
fi
echo ' node is down!! 服务被终止'
date;
# 需要报告下吗？但是只能匿名
# wget -qO- https://query.serverCheck
sleep $timer;
let timer=$timer+60;
done