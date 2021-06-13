#create image
#docker build - < Dockerfile -t "python-website"   
#create and run container
#ocker run -p 5000:5000  -v /Users/jessica/Documents/GitHub:/usr/src --env PORT=5000 python-website

# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.177.0/containers/python-3/.devcontainer/base.Dockerfile

# [Choice] Python version: 3, 3.9, 3.8, 3.7, 3.6
ARG VARIANT="3.9"
FROM mcr.microsoft.com/vscode/devcontainers/python:0-${VARIANT}
WORKDIR /usr/src

EXPOSE 5000

# [Option] Install Node.js
ARG INSTALL_NODE="true"
ARG NODE_VERSION="lts/*"
RUN if [ "${INSTALL_NODE}" = "true" ]; then su vscode -c "umask 0002 && . /usr/local/share/nvm/nvm.sh && nvm install ${NODE_VERSION} 2>&1"; fi

# [Optional] If your pip requirements rarely change, uncomment this section to add them to the image.
# COPY requirements.txt /tmp/pip-tmp/
# RUN pip3 --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/requirements.txt \
#    && rm -rf /tmp/pip-tmp

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment this line to install global node packages.
# RUN su vscode -c "source /usr/local/share/nvm/nvm.sh && npm install -g <your-package-here>" 2>&1

RUN \
    pip install jupyter\
    pip install scipy\
    pip install numpy\
    pip install matplotlib\
    pip install sklearn\
    pip install networkx\
    pip install pandas\
    pip install scikit-image\
    pip install flask
    
RUN \
    apt-get -y install git

RUN \
    git clone https://github.com/jmanzion/jessica-personal-website.git

ENV FLASK_ENV=development

ENV FLASK_APP=jessica-personal-website/app 

CMD flask run --host 0.0.0.0 --port $PORT

