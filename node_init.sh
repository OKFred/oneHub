# node app initialization   初始化
## FREDZ @2022
if pgrep -f 'node_githubMonitor.sh' > /dev/null; then
    killall node_githubMonitor.sh
fi
nohup sh ./node_githubMonitor.sh