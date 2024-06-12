include .env
export $(shell sed 's/=.*//' .env)

TF_IMAGE = hashicorp/terraform:1.8.1
AWS_IMAGE = public.ecr.aws/aws-cli/aws-cli
TERRAFORM_CMD = docker run -i -t -v ${PWD}:/work -w /work --env-file .env ${TF_IMAGE}
AWS_CMD = docker run -v ${PWD}:/work -w /work --env-file .env ${AWS_IMAGE}

get-caller-identity:
	${AWS_CMD} sts get-caller-identity
init:
	${TERRAFORM_CMD} init
workspace:
	${TERRAFORM_CMD} workspace select --or-create ${WORKSPACE}
build-lambdas:
	cd nodejs-lambdas && npm install
apply: build-lambdas
	${TERRAFORM_CMD} apply
apply-quick:
	${TERRAFORM_CMD} apply --auto-approve 
output:
	${TERRAFORM_CMD} output -json