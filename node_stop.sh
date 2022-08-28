# node app termination   结束进程
## FREDZ @2022
echo '当前守护进程:'  $(pgrep -f 'node_githubMonitor.sh')
echo '当前Node进程:' $(pgrep -f 'node node_githubApp.js')
if pgrep -f 'node_githubMonitor.sh' > /dev/null
then
    kill -15 $(pgrep -f 'node_githubMonitor.sh')
fi
if pgrep -f 'node node_githubApp.js' > /dev/null
then
    kill -15 $(pgrep -f 'node node_githubApp.js')
fi
