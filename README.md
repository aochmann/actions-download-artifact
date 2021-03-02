# Download artifact GitHub Action

An action that downloads and extracts uploaded artifact by name.

## Usage

```yaml
- name: Download artifact
  uses: aochmann/actions-download-artifact@1.0.0
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
