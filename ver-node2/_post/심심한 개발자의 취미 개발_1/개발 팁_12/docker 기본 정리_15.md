```json
{
    "date": 20250328,
    "prev":null,
    "next":null
}
```

- 도커는 컨테이너라는 경량 단위로 애플리케이션을 실행하는 기능을 제공하는 플랫폼이다.
- 컨테이너는 독립적인 호스트명, IP주소, 디스크 볼륨을 갖는다.
- 도커의 핵심은 격리(isolation)와 밀집(density)
	- 밀집이란 컴퓨터에 CPU와 메모리가 허용하는 한 되도록 많은 수의 애플리케이션을 실행하는 것을 의미한다.

- 컨테이너는 내부의 애플리케이션이 실행 중이어야 컨테이너의 상태도 실행 중이 된다
- 컨테이너가 종료돼도 컨테이너는 사라지지 않는다.
- 설치된 도커는 호스트 컴퓨터의 네트워크 계층을 감시하며 호스트 컴퓨터에서 들나드는 네트워크 트레픽을 모두 도커가 가로채서 그중 필요한 것을 컨테이너에 전달하게 된다.


## Docker 기본 명령어
### 이미지 관련 명령어
- 이미지 검색
```bash
docker search [image name]
```

- 이미지 다운
```bash
# version에 latest를 붙이면 최신버전으로 다운
docer pull [image name]:[version]
```

- 이미지 삭제
```bash
docker rmi [image id]

# -f : 컨테이너와 이미지 함께 삭제
docker rmi -f [image id]
```
- 이미지 목록 보기
```bash
docker image ls
docker images
```

### 컨테이너 관련 명령어
- 컨테이너 목록 보기
```bash
docker ps
docker container ls

# 모든 컨테이너 목록 (작동 및 종료 상태의 모든 컨테이너)
docker ps -a
```

- 컨테이너 생성
```bash
docker create [OPTIONS] IMAGE [COMMAND] [ARG...]
```
 
- 컨테이너 실행
```bash
docker start [container id | container name]
```

- 컨테이너 실행
```bash
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

> docker create / start / run 의 차이점
> - create : docker image를 기반으로 컨테이너 생성
> - start : 이미 생성되어 있는 컨테이너를 실행
> - run : create + start 기능으로 컨테이너가 생성되어 있다면 실행 없다면 이미지 기반으로 생성 후 실행, 이미지에도 없다면 docker hub등에서 pull 받은 후 실행


- 컨테이너 재시작
```bash
docker restart [container id | container name]
```

- 컨테이너 정지
```bash
docker stop [container id | container name]
```

- 컨테이너 삭제
```bash
docker rm [OPTIONS] CONTAINER [CONTAINER...]

# 모든 컨테이너 삭제
docker rm docker ps -a -q

# 컨테이너 강제 삭제 (실행중인 컨테이너 포함)
docker rm -f CONTAINER

# 모든 컨테이너 강제 삭제 
docker rm -f $(docker ps -a -q)
```

- 컨테이너 로그
```bash
docker logs [OPTIONS] CONTAINER
```

- 컨테이너 상세 정보
```bash
docker inspect [OPTIONS] NAME|ID [NAME|ID...]
```

- 컨테이너 실시간 리소스
```bash
docker stats [OPIONS] [CONTAINER...]
```

## Docker run 기본 옵션
- Docker run 커맨드 기본 포멧
```bash
docker run (<options>) <imageId> (<command>) (<parameter>)
```

- `-d` option
	- `-d` 옵션을 사용하면 컨테이너가 detached 모드에서 실행되며, 실행 결과로 컨테이너 ID만을 출력합니다.
	- `-d` 옵션없이 실행했다면 해당 터미널에서 `command c` 를 눌러서 빠져 나오는 순간 해당 컨테이너는 종료 됩니다.
```bash
docker run -d python:3.8-alpine
```

- `—-interactive` option
	- 컨테이너 접속 상태 유지 옵션

- `—-tty` option
	- 터미널 세션을 통한 컨테이너 조작 옵션
```bash
docker run —interaction —tty [image]:[tag]
```


- `-it` option
	- `-i`옵션과 `-t`옵션은 함께 쓰이면 컨테이너를 종료하지 않은체로, 터미널의 입력을 계속해서 컨테이너로 전달하기 위해서 사용합니다.
```bash
docker run -it python:3.8-alpine

docker run -it python:3.8-alpine /bin/sh
```

- `--name` option
	- `—-name` 옵션을 사용하여 컨테이너에 이름을 부여할수 있습니다. 
	- 부여된 이름으로 컨테이너를 식별 할 수 있습니다.
```bash
docker run -d —-name my-server python:3.8-alpine python -m http.server
docker ps
docker kill my-server
docker rm my-server
```

- `-e` option
	- `-e` 옵션은 docker container의 환경변수를 설정하기 위해서 사용합니다.
	- `-e` 옵션을 사용하면 Dockerfile의 ENV 설정도 덮어써지게 됩니다.
```bash
docker run -e FOO=bar python:3.8-alpine env
```

- `-p` option
	- `-p` 옵션은 호스트와 컨테이너간의 포트(port) 배포 / 바인드 (bind)를 위해서 사용됩니다.
	- 호스트 컴퓨터에서 컨테이너에서 리스닝 하고 있는 포트로 접속할 수 있도록 설정해줍니다.
```bash
# 컨테이너 내부에서 8000포트로 리스닝 하고 있는 HTTP서버를 호스트 컴퓨터에서 80 포트로 접속할 수 있도록 설정
docker run -d -p 80:8000 python:3.8-alpine python -m http.server
```

- `-v` option
	- `-v` 옵션은 호스트와 컨테이너 간의 볼륨 설정을 위해서 사용됩니다.
	- 호스트 컴퓨터의 파일 시스템의 특정 경로를 컨테이너의 파일 시스템의 특정 경로로 마운트 합니다.
```bash
echo Hi > test.txt
docker run -v `pwd`:etc python:3.8-alpine cat /etc/test.txt
```

- `-w` option
	- `-w` 옵션은 Dockerfile의 WORKDIR 설정을 덮어쓰기 위해 사용됩니다.
```bash
docker run -w /etc python:3.8-alpine pwd
```

- `—-entrypoint` option
	- `—-entrypoint` 옵션은 Dockerfile의 ENTRYPOINT 설정을 덮어쓰기 위해서 사용합니다.
```bash
docker run —-entrypoint python python:3.8-alpine —-version
```

- `—-rm` option
	- `—-rm` 옵션은 컨테이너가 종료될 때 컨테이너와 관련된 리소스(파일 시스템, 볼륨) 까지 깨끗이 제거합니다.
```bash
docker run —-rm -it wernight/funbox nyancat
```