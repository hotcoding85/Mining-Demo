import React, { useState } from 'react';
import DeleteModal from './DeleteModal'; // Adjust the path as needed
import { Link } from 'react-router-dom';

const DeleteButton = ({ onDelete, item }) => {
    const [modalOpen, setModalOpen] = useState(false);

    const toggleModal = () => setModalOpen(!modalOpen);

    const handleDelete = () => {
        onDelete(); // Call onDelete function passed from parent component
        toggleModal(); // Close the modal after deletion
    };

    return (
        <>
            <Link to="#!" className="text-danger"
                onClick={(event: any) => {
                    event.preventDefault();
                    toggleModal();
                }}  >
                <i className="mdi mdi-delete font-size-18" id="deletetooltip" />
            </Link>
            {/* <Button color="danger" onClick={toggleModal}>Delete</Button> */}
            <DeleteModal item={item} isOpen={modalOpen} toggle={toggleModal} onConfirm={handleDelete} />
        </>
    );
};

export default DeleteButton;
