include ../../../.env
export $(shell sed 's/=.*//' ../../../.env)

TF_IMAGE = hashicorp/terraform:1.8.1
TERRAFORM_CMD = docker run -i -t -v ${PWD}:/work -w /work/terraform --env-file ../../../.env ${TF_IMAGE}

init:
	${TERRAFORM_CMD} init
workspace:
	${TERRAFORM_CMD} workspace select --or-create ${WORKSPACE}
build-lambdas:
	cd src/ && npm install
apply: build-lambdas
	${TERRAFORM_CMD} apply
apply-quick:
	${TERRAFORM_CMD} apply --auto-approve 
output:
	${TERRAFORM_CMD} output -json
