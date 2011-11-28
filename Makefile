setup:
	@git submodule update --init --recursive
	@npm install express@2.5.1

test:
	@node Specs/Helpers/request

update_submodules:
	@git submodule foreach 'git pull origin master'

.PHONY: setup test server update_submodules
