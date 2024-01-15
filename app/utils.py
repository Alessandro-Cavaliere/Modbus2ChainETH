import os


# Verifica se una directory esiste sul BeagleBone Black
def directory_exists(sftp, directory_path):
    try:
        sftp.stat(directory_path)
        return True
    except FileNotFoundError:
        return False


# Verifica se un file esiste sul BeagleBone Black
def file_exists(sftp, file_path):
    try:
        sftp.stat(file_path)
        return True
    except FileNotFoundError:
        return False


def load_files_on_bbb(bbb):
    try:
        # Local directory and file paths
        local_directory_path = 'app/iot-files/Modbus2Chain-master/package/umodbus'
        local_master_file_path = 'app/iot-files/Modbus2Chain-master/master.py'

        # Remote paths on the BeagleBone Black
        remote_file_path_micropython_modbus = '/var/lib/cloud9/Modbus2Chain-master/package/umodbus'
        remote_dir_path_master = '/var/lib/cloud9/Modbus2Chain-master'
        remote_file_path_master = '/var/lib/cloud9/Modbus2Chain-master/master.py'
        remote_dir_path_package = '/var/lib/cloud9/Modbus2Chain-master/package'
        remote_dir_path_umodbus = '/var/lib/cloud9/Modbus2Chain-master/package/umodbus'

        # Initialize the SFTP connection
        sftp = bbb.open_sftp()

        # Create directories if they don't exist
        if not directory_exists(sftp, remote_dir_path_master):
            print("Creating remote directory: {}".format(remote_dir_path_master))
            sftp.mkdir(remote_dir_path_master)

        if not directory_exists(sftp, remote_dir_path_package):
            print("Creating remote directory: {}".format(remote_dir_path_package))
            sftp.mkdir(remote_dir_path_package)

        if not directory_exists(sftp, remote_dir_path_umodbus):
            print("Creating remote directory: {}".format(remote_dir_path_umodbus))
            sftp.mkdir(remote_dir_path_umodbus)

        # Get the list of local files
        remote_files = os.listdir(local_directory_path)
        local_file_paths = [os.path.normpath(os.path.join(
            local_directory_path, filename)).replace("\\", "/") for filename in remote_files]

        # Copy files if they don't exist already
        for local_file_path in local_file_paths:
            filename = "/" + os.path.basename(local_file_path)
            remote_file_path = remote_file_path_micropython_modbus + filename

            if not file_exists(sftp, remote_file_path):
                print("Uploading file {}...".format(filename))
                sftp.put(local_file_path, remote_file_path)
            else:
                print("File {} already exists on the BeagleBone Black.".format(filename))

        # Copy the master.py file if it doesn't exist already
        if not file_exists(sftp, remote_file_path_master):
            print("Uploading file master.py...")
            sftp.put(local_master_file_path, remote_file_path_master)
        else:
            print("File master.py already exists on the BeagleBone Black.")

        # Close the SFTP connection
        sftp.close()

        print("Upload completed successfully.")
        return True

    except Exception as e:
        print("Error during file upload: {}".format(e))
        return False
