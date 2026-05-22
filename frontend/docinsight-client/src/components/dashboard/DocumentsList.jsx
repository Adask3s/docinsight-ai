// src/components/DocumentsList.jsx
import styles from "./DocumentsList.module.css"; // <--- Import styli

function DocumentsList({ documents, onSelectDocument, onDeleteDocument }) {
  const handleDeleteClick = (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this document from history? This action cannot be undone.",
      )
    ) {
      onDeleteDocument(id);
    }
  };

  return (
    <div className={styles.listContainer}>
      {documents.length === 0 ? (
        <p className={styles.emptyText}>Brak zapisanych dokumentów.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>L.p</th>
              <th>Plik</th>
              <th>Data</th>
              <th className={styles.actionsHeader}>Akcja</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, index) => (
              <tr key={doc.id}>
                <td>{index + 1}</td>
                <td>{doc.fileName}</td>
                <td>{new Date(doc.uploadedAt).toLocaleString()}</td>
                <td className={styles.actionsCell}>
                  <div className={styles.actionsWrapper}>
                    <button
                      onClick={() => onSelectDocument(doc.id)}
                      className={`${styles.iconButton} ${styles.viewBtn}`}
                    >
                      Zobacz
                    </button>
                    <button
                      onClick={() => handleDeleteClick(doc.id)}
                      className={`${styles.iconButton} ${styles.deleteBtn}`}
                      title="Delete document from history"
                    >
                      Usuń
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DocumentsList;
