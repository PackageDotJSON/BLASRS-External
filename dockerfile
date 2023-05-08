FROM node:16.18.0

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install app dependencies
RUN npm install

# Install PM2 - a package manager for node.js applications that can handle load balancing etc.
RUN npm install pm2 -g

# Bundle app source
COPY . .

# Download oracle client library
WORKDIR /app/oracle

RUN apt-get update && \
    apt-get install -y libaio1 unzip wget

RUN wget https://download.oracle.com/otn_software/linux/instantclient/218000/instantclient-basic-linux.x64-21.8.0.0.0dbru.zip && \
    unzip instantclient-basic-linux.x64-21.8.0.0.0dbru.zip && \
    rm -f instantclient-basic-linux.x64-21.8.0.0.0dbru.zip

# Download db2 client library
WORKDIR /app/db2

RUN wget https://public.dhe.ibm.com/storage/tivoli-storage-management/maintenance/client/v7r1/Linux/LinuxX86/BA/v716/gskit8_linuxx86_64_8.0-50.45.tar.gz && \
    tar -xvf gskit8_linuxx86_64_8.0-50.45.tar.gz && \
    rm -f gskit8_linuxx86_64_8.0-50.45.tar.gz

# Navigate to the server directory
WORKDIR /app/server

# Set node environment to production
ENV NODE_ENV production

# Navigate to the app directory
WORKDIR /app

#Add oracle client library path to system variable
ENV LD_LIBRARY_PATH=/app/oracle/instantclient_21_8:/app/db2/gsk8
ENV ORACLE_CLIENT_LOCATION=/app/oracle/instantclient_21_8
ENV PORT=3002
ENV ADDRESS=0.0.0.0

# Expose the port that the node.js will listen to
EXPOSE 3002

# Run the node.js server using the PM2
CMD ["pm2-runtime", "./server/server.js"]

