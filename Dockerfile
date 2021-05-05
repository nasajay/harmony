# FROM ubuntu:16.04
FROM node:12-buster

# RUN apt update         && \
#     apt upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"  && \
#     apt install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"     \
#         postgresql \
#         libpq-dev  \
#         g++        \
#         python     \
#         make       \
#         git        \
#         bash       \
#         vim        \
#         sqlite     \
#         curl

# SHELL ["/bin/bash", "-c"]
# RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
RUN mkdir -p /harmony
WORKDIR /harmony
# RUN /bin/bash -c 'source /root/.nvm/nvm.sh; \
# nvm install && nvm use && npm install'
# USER node
ENTRYPOINT [ "npm", "run", "start-dev" ]
# ENTRYPOINT [ "cd", "/harmony", "&&", "./bin/start-harmony" ]