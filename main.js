const core = require('@actions/core')
const github = require('@actions/github')
const AdmZip = require('adm-zip')
const { filesize } = require("filesize");
const moment = require('moment')
const pathname = require('path')
const fs = require("fs")
const lodash = require('lodash')

function getLatest(artifacts) {
  var latestArtifact = artifacts.reduce((prev, cur, index) => {
    var prevDate = new moment(prev.updated_at);
    var curDate = new moment(cur.updated_at);

    return curDate > prevDate && index ? cur : prev;
  });

  return latestArtifact
}

async function main() {
  try {
    // required
    const token = core.getInput("github_token", { required: true });
    const [owner, repo] = core.getInput("repo", { required: true }).split("/");
    const path = core.getInput("path", { required: true })

    // optional
    const artifactName = core.getInput("name", { required: false });
    const latest_input = (core.getInput("latest", { required: false }));
    const latest = latest_input ? latest_input.toLowerCase() === 'true' : false;

    const client = github.getOctokit(token);

    console.log('input', path, artifactName, latest);

    console.log("==> Repo:", owner + "/" + repo);

    const artifactsEndpoint = "GET /repos/:owner/:repo/actions/artifacts";
    const artifactsEndpointParams = {
      owner: owner,
      repo: repo,
      per_page: 100
    };

    let artifacts = [];

    for await (const artifactResponse of client.paginate
      .iterator(artifactsEndpoint, artifactsEndpointParams)) {
        artifacts = artifacts.concat(artifactResponse.data
        .filter(artifact => !artifact.expired)
        .filter(artifact => artifactName ? artifact.name === artifactName : true)
      );
    }

    if (latest && artifacts && artifacts.length) {
      console.log('Get latest artifact');

      var latestArtifact = getLatest(artifacts);

      if (latestArtifact) {
        console.log('Latest artifact', latestArtifact);
        artifacts = [ latestArtifact ];
      }
    }

    if (artifacts && artifacts.length) {
      artifacts = lodash(artifacts)
        .groupBy(artifact => artifact.name)
        .map(value => getLatest(value))
        .value();
    }

    console.log('Artifacts', artifacts);

    if (artifacts && artifacts.length) {
      console.log('Artifact found')
      core.setOutput('found-artifact', true)
      core.setOutput('path', pathname.resolve(path))
      
      for (let artifact of artifacts) {
        console.log("==> Artifact:", artifact.id);

        const size = filesize(artifact.size_in_bytes, { base: 10 });

        console.log("==> Downloading:", artifact.name + ".zip", `(${size})`);

        const zip = await client.rest.actions.downloadArtifact({
          owner: owner,
          repo: repo,
          artifact_id: artifact.id,
          archive_format: "zip",
        });

        const dir = artifactName ? path : pathname.join(path, artifact.name);

        fs.mkdirSync(dir, { recursive: true });

        const adm = new AdmZip(Buffer.from(zip.data));

        adm.getEntries().forEach((entry) => {
          const action = entry.isDirectory ? "creating" : "inflating";
          const filepath = pathname.join(dir, entry.entryName);

          console.log(`  ${action}: ${filepath}`)
        });

        adm.extractAllTo(dir, true);
      }
    } else {
      console.log('Artifact NOT found')
      core.setOutput('found-artifact', false)
      core.setOutput('path', '')
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main()