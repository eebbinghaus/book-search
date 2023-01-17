// import  { useState, useEffect } from 'react';
import React from "react";
import { useState, useEffect } from "react";
// bootstrap components
import {
  Jumbotron,
  Container,
  CardColumns,
  Card,
  Button,
} from "react-bootstrap";
// router
import { Navigate, useParams } from "react-router-dom";
// Authservice
import Auth from "../utils/auth";
// graphql
import { removeBookId } from "../utils/localStorage";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";

const SavedBooks = () => {
  const [userData, setUserData] = useState({});
  // If there is no `profileId` in the URL as a parameter, execute the `QUERY_ME` query instead for the logged in user's information
  const { loading, data } = useQuery(GET_ME);
  const [removeBook, { error }] = useMutation(REMOVE_BOOK);

  // set the userData on load using the query
  // if (data){
  //     setUserData(data?.me || {})
  // }
  console.log(data);
  // const userData = data?.me || {};
  // useEffect(() => {
  // setUserData({...data?.me} || {});
  //     // Update the document title using the browser API
  //     const userData1 = data?.me || {};
  //   });

  useEffect(() => {
    setUserData(data?.me || {});
  }, [data]);

  // Use React Router's `<Navigate />` component to redirect to personal profile page if username is yours
  if (!Auth.loggedIn()) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData?.username) {
    return (
      <h4>
        You need to be logged in to see your books. Use the navigation links
        above to sign up or log in!
      </h4>
    );
  }

  // use this to determine if `useEffect()` hook needs to run again
  // const userDataLength = Object.keys(meData).length;

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await removeBook({ variables: { bookId } });

      // if (!data.removeBook) {
      // throw new Error('something went wrong!');
      // }

      //   const updatedUser = await response.json();
      setUserData({
        ...userData,
        ["savedBooks"]: [...data.removeBook.savedBooks],
      });
      // userData = [...data];
      console.log(data);
      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Jumbotron fluid className="text-light bg-dark">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedBooks?.length
            ? `Viewing ${userData.savedBooks?.length} saved ${
                userData.savedBooks?.length === 1 ? "book" : "books"
              }:`
            : "You have no saved books!"}
        </h2>
        <CardColumns>
          {userData.savedBooks?.map((book) => {
            return (
              <Card key={book.bookId} border="dark">
                {book.image ? (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button
                    className="btn-block btn-danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;
