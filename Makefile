.PHONY: test

test:
	docker build -t registry.gitlab.com/obsessvr/360experiences/mall/test:master .
	docker run registry.gitlab.com/obsessvr/360experiences/mall/test:master /bin/bash -c "npm test"