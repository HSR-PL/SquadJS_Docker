#!/bin/sh

REPO_PATH=/home/app/SquadJS
TEMP_REPO_PATH=/home/app/SquadJS-tmp
GIT_REPO=${GIT_REPO:-https://github.com/Team-Silver-Sphere/SquadJS.git}
GIT_TAG=${GIT_TAG:-latest}
GIT_COMMIT=${GIT_COMMIT:-HEAD}
GIT_BRANCH=${GIT_BRANCH:-master}
PLUGINS_LIST=${PLUGINS_LIST:-}

echo "test";

check_repo_updated_and_synced() {
    cd "$TEMP_REPO_PATH" || return 1
    git fetch

    remote_head=$(git rev-parse "origin/${GIT_BRANCH}")
    local_head=$(git rev-parse HEAD)
    if [ "$remote_head" != "$local_head" ]; then
        return 1
    fi

    prev_tag=$(cat "$TEMP_REPO_PATH/.git_prev_tag" 2>/dev/null)
    prev_commit=$(cat "$TEMP_REPO_PATH/.git_prev_commit" 2>/dev/null)
    prev_branch=$(cat "$TEMP_REPO_PATH/.git_prev_branch" 2>/dev/null)
    if [ "$prev_tag" != "$GIT_TAG" ] || [ "$prev_commit" != "$GIT_COMMIT" ] || [ "$prev_branch" != "$GIT_BRANCH" ]; then
        return 1
    fi

    return 0
}

if [ ! -d "$TEMP_REPO_PATH/.git" ]; then
    echo "Repository cloning to temp dir"
    git clone "$GIT_REPO" "$TEMP_REPO_PATH"
fi

cd "$TEMP_REPO_PATH" || exit 1

if [ "$GIT_TAG" != "latest" ]; then
    git checkout "tags/$GIT_TAG"
elif [ "$GIT_COMMIT" != "HEAD" ]; then
    git checkout "$GIT_COMMIT"
else
    git checkout "$GIT_BRANCH"
fi

if ! check_repo_updated_and_synced; then
    echo "Updating repository temp dir"
    git pull
    echo "Copying repository temp dir"
    find "$TEMP_REPO_PATH" -mindepth 1 -maxdepth 1 ! -name 'config.json' -exec cp -R {} "$REPO_PATH/" \;
fi

echo "$GIT_TAG" > "$TEMP_REPO_PATH/.git_prev_tag"
echo "$GIT_COMMIT" > "$TEMP_REPO_PATH/.git_prev_commit"
echo "$GIT_BRANCH" > "$TEMP_REPO_PATH/.git_prev_branch"

if [ -n "$PLUGINS_LIST" ]; then
    echo "Plugins downloading"
    OLD_IFS=$IFS
    IFS=','
    for plugin in $PLUGINS_LIST; do
        # Extract the filename from the URL
        filename=$(basename "$plugin")

        # Download to a temporary file
        wget -O "/tmp/$filename" "$plugin"

        # Copy the file from the temporary location to the final destination, overwriting if necessary
        cp -f "/tmp/$filename" "$REPO_PATH/squad-server/plugins/$filename"

    done
    IFS=$OLD_IFS
fi

echo "Copy local plugins from mounted volume"
cp -fR /home/app/local-plugins/* "$REPO_PATH/squad-server/plugins/"

echo "Copy local SquadJS components from mounted volume"
cp -fr /home/app/customs/* "$REPO_PATH/"

cd "$REPO_PATH" || exit 1
yarn install && yarn cache clean
node index.js




