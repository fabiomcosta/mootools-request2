test: setup

setup:
	@git submodule update --init --recursive
	@npm install --dev .

server:
	node Specs/Helpers/request

update_submodules:
	git submodule foreach 'git pull origin master'

.PHONY: setup test server update_submodules
