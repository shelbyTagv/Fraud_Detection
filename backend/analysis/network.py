# TECHNIQUE 3: NETWORK ANALYSIS
# Models vendor-employee payment relationships as a graph.
# Detects suspicious hubs (one employee paying many vendors or one vendor receiving from many employees).
# Also detects potential vendor collusion clusters.

import pandas as pd
import networkx as nx

def run_network_analysis(df: pd.DataFrame) -> dict:
    """
    Builds a bipartite graph: employees on one side, vendors on the other.
    Edges represent payment relationships.
    High centrality nodes are flagged as suspicious.
    """
    if "employee_id" not in df.columns or "vendor_name" not in df.columns:
        return {"error": "Requires employee_id and vendor_name columns"}

    G = nx.Graph()

    # Build graph: each unique employee-vendor payment = edge
    # Weight = number of transactions between them
    for _, row in df.iterrows():
        emp = f"EMP:{str(row.get('employee_id', '')).strip()}"
        vendor = f"VND:{str(row.get('vendor_name', '')).strip()}"
        amount = float(row.get("amount_usd", 0))

        if G.has_edge(emp, vendor):
            G[emp][vendor]["weight"] += 1
            G[emp][vendor]["total_amount"] += amount
        else:
            G.add_edge(emp, vendor, weight=1, total_amount=amount)

    if G.number_of_nodes() == 0:
        return {"error": "No graph could be built from this data"}

    # Calculate centrality measures
    degree_centrality = nx.degree_centrality(G)
    betweenness_centrality = nx.betweenness_centrality(G, normalized=True)

    # Score each node combining both centrality measures
    node_scores = {}
    for node in G.nodes():
        node_scores[node] = round(
            (degree_centrality.get(node, 0) * 0.5 +
             betweenness_centrality.get(node, 0) * 0.5), 4
        )

    # Top suspicious nodes (sorted by combined score)
    suspicious_nodes = sorted(node_scores.items(), key=lambda x: x[1], reverse=True)[:15]

    nodes_data = []
    for node, score in suspicious_nodes:
        node_type = "Employee" if node.startswith("EMP:") else "Vendor"
        label = node.replace("EMP:", "").replace("VND:", "")
        connections = list(G.neighbors(node))
        total_paid = sum(
            G[node][n].get("total_amount", 0) for n in connections
        )
        nodes_data.append({
            "id": node,
            "label": label,
            "type": node_type,
            "risk_score": round(score * 100, 1),
            "connections": len(connections),
            "total_amount_usd": round(total_paid, 2),
            "suspicious": score > 0.3
        })

    # Build edges list for frontend graph rendering (limit to 200)
    edges_data = []
    for u, v, data in list(G.edges(data=True))[:200]:
        edges_data.append({
            "source": u,
            "target": v,
            "weight": data.get("weight", 1),
            "total_amount": round(data.get("total_amount", 0), 2)
        })

    suspicious_count = sum(1 for n in nodes_data if n["suspicious"])

    return {
        "technique": "Network Analysis",
        "node_count": G.number_of_nodes(),
        "edge_count": G.number_of_edges(),
        "suspicious_nodes": nodes_data,
        "suspicious_node_count": suspicious_count,
        "edges": edges_data,
        "risk": "HIGH" if suspicious_count > 5 else "MEDIUM" if suspicious_count > 2 else "LOW",
        "suspicious": suspicious_count > 0
    }
