#!/bin/bash
echo "=== GIT STATUS ===" > debug_git_output.log
git status >> debug_git_output.log 2>&1
echo "\n=== GIT LOG ===" >> debug_git_output.log
git log -1 >> debug_git_output.log 2>&1
echo "\n=== GIT PUSH ===" >> debug_git_output.log
git push >> debug_git_output.log 2>&1
