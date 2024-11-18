#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dirent.h>
#include <sys/stat.h>

// Function to recursively list directories and files with full paths
void listDirectory(const char *basePath, int level, FILE *file) {
    struct dirent *entry;
    DIR *dir = opendir(basePath);

    if (dir == NULL) {
        perror("Unable to open directory");
        return;
    }

    // Loop through all entries in the directory
    while ((entry = readdir(dir)) != NULL) {
        // Skip the "." and ".." entries
        if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0) {
            continue;
        }

        // Build the full path for each entry
        char path[1024];
        snprintf(path, sizeof(path), "%s/%s", basePath, entry->d_name);

        // Print the full path with indentation for hierarchy
        for (int i = 0; i < level; i++) {
            fprintf(file, "");  // Indentation for visual hierarchy
        }
        fprintf(file, "%s\n", path);  // Print the full path of the directory or file

        // Check if the entry is a directory
        struct stat statbuf;
        if (stat(path, &statbuf) == 0 && S_ISDIR(statbuf.st_mode)) {
            // Recursively list the subdirectory
            listDirectory(path, level + 1, file);
        }
    }

    closedir(dir);
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        fprintf(stderr, "Usage: %s <directory_path>\n", argv[0]);
        return 1;
    }

    // Open a text file to write the directory structure
    FILE *file = fopen("directory_structure.txt", "w");
    if (file == NULL) {
        perror("Unable to create file");
        return 1;
    }

    // Start listing from the specified path
    listDirectory(argv[1], 0, file);

    // Close the file
    fclose(file);

    printf("Directory structure saved in directory_structure.txt\n");
    return 0;
}
