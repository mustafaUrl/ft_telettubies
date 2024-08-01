all:
	mkdir -p ~/goinfre/docker
	mkdir -p ~/goinfre/DockerDesktop
	mkdir -p ~/goinfre/Containers
	rm -rf ~/Library/Caches/*
	rm -rf ~/.docker
	rm -rf ~/Library/Containers/com.docker.docker
	cd ~/Library/Containers && ln -s ~/goinfre/Containers com.docker.docker
	cd ~/Library/Caches && ln -s ~/goinfre/DockerDesktop com.docker.docker
	cd ~ && ln -s ~/goinfre/docker .docker
	
env:
	echo "export PATH=\"$PATH:/System/Volumes/Data/Applications/Docker.app/Contents/Resources/bin/:/System/Volumes/Data/Applications/Docker.app/Contents/Resources/bin/docker-compose-v1/\"" >> ~/.zshrc

hakan:
	mkdir /Users/$(USER)/library/containers/com.docker.docker/Data