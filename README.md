# Download artifact GitHub Action



## Usage

```yaml
- name: Download artifact
  uses: aochmann/action-download-artifact@v1
  with:
    # Optional, GitHub token
    github_token: ${{secrets.GITHUB_TOKEN}}

    # Optional, uploaded artifact name,
    # will download all artifacts if not specified
    # and extract them in respective subdirectories
    # https://github.com/actions/download-artifact#download-all-artifacts
    name: artifact_name

    # Optional, download latest artifact
    latest: true

    # Optional, directory where to extract artifact
    path: extract_here

    # Optional, defaults to current repo
    repo: ${{github.repository}}
```
