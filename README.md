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
docker run -it wait-for-github-workflow wait  -o VEV-platform-services -r wait-for-github-workflow -w "Build and Publish Docker Image" -b abcdef
docker run -it wait-for-github-workflow trigger  -o VEV-platform-services -r wait-for-github-workflow -w "Build and Publish Docker Image" -b main
```

### TypeScript
```bash
export GITHUB_TOKEN=...
npm run wait -- -o VEV-platform-services -r wait-for-github-workflow -w "Build and Publish Docker Image" -b abcdef
npm run trigger -- -o VEV-platform-services -r wait-for-github-workflow -w "Build and Publish Docker Image" -b main
```