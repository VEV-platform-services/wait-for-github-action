# wait-for-github-workflow
A docker image to wait for a GitHub workflow to finish running

## Build

### Docker
```bash
docker build -t wait-for-github-workflow .
```

### TypeScript
```bash
npm install
npm run build
```

## Usage

### Docker
```bash
export GITHUB_TOKEN=...
docker run -it wait-for-github-workflow wait -r VEV-platform-services/wait-for-github-workflow -w "Build and Publish Docker Image" -b abcdef
docker run -it wait-for-github-workflow trigger -r VEV-platform-services/wait-for-github-workflow -w "Build and Publish Docker Image" -b main
```

### TypeScript
```bash
export GITHUB_TOKEN=...
npm run wait -- -r VEV-platform-services/wait-for-github-workflow -w "Build and Publish Docker Image" -b abcdef
npm run trigger -- -r VEV-platform-services/wait-for-github-workflow -w "Build and Publish Docker Image" -b main
```